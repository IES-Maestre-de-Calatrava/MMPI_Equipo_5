package com.example.mmpi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.sql.Timestamp;
import java.util.Iterator;

@Service
public class JsonToSQLService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.json.folder}")
    private String folderPath;

    public JsonToSQLService(JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;

    }

    public void loadJsonToDatabase() {

        String sqlSesion = "INSERT INTO SESION " +
                "(ID_SESION, ACELERACIONES_BRUSCAS, COLISIONES, ESTABILIDAD, NIVEL, PARADAS_BRUSCAS, SCORE, TIEMPO_MOVIMIENTO, TIEMPO_SESION, DNI_FISIO, DNI_PACIENTE) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        ObjectMapper mapper = new ObjectMapper();

        File folder = new File(folderPath);

        if (!folder.exists() || !folder.isDirectory()) {

            System.err.println("Folder not found: " + folderPath);
            return;

        }

        File[] files = folder.listFiles((dir, name) -> name.endsWith(".json"));

        if (files == null || files.length == 0) {

            System.out.println("No JSON files found in: " + folderPath);
            return;

        }

        int totalInsertadas = 0;
        int totalSaltadas = 0;
        int totalPacientesCreados = 0;

        for (File file : files) {

            System.out.println("Processing file: " + file.getName());

            int insertadasArchivo = 0;
            int saltadasArchivo = 0;
            int pacientesCreadosArchivo = 0;

            try {

                JsonNode root = mapper.readTree(file);

                Iterator<String> userIds = root.fieldNames();

                while (userIds.hasNext()) {

                    String userId = userIds.next();
                    JsonNode userNode = root.get(userId);

                    String dniPaciente = crearDniPacienteAutomatico(userId);

                    boolean pacienteCreado = insertarPacientePendienteSiNoExiste(dniPaciente, userId);

                    if (pacienteCreado) {

                        pacientesCreadosArchivo++;

                    }

                    JsonNode sesionesNode = userNode.get("sesiones");

                    if (sesionesNode == null) {

                        continue;

                    }

                    Iterator<String> fechas = sesionesNode.fieldNames();

                    while (fechas.hasNext()) {

                        String fechaKey = fechas.next();
                        JsonNode sesionesDia = sesionesNode.get(fechaKey);

                        Iterator<String> sesiones = sesionesDia.fieldNames();

                        while (sesiones.hasNext()) {

                            String idSesion = sesiones.next();

                            if (sesionYaExiste(idSesion)) {

                                actualizarPacienteSesionSiHaceFalta(idSesion, dniPaciente);
                                saltadasArchivo++;
                                continue;

                            }

                            JsonNode data = sesionesDia.get(idSesion);

                            int aceleraciones = data.get("aceleraciones_bruscas").asInt();
                            int colisiones = data.get("colisiones").asInt();
                            int estabilidad = data.get("estabilidad").asInt();
                            String nivel = data.get("nivel").asText();
                            int paradas = data.get("paradas_bruscas").asInt();
                            int score = data.get("score").asInt();

                            int tiempoMovimiento = (int) (data.get("tiempo_movimiento").asLong() / 1000);

                            long rawTimestamp = data.get("timestamp").asLong();

                            Timestamp tiempoSesion = new Timestamp(rawTimestamp * 1000);

                            jdbcTemplate.update(sqlSesion,

                                    idSesion,
                                    aceleraciones,
                                    colisiones,
                                    estabilidad,
                                    nivel,
                                    paradas,
                                    score,
                                    tiempoMovimiento,
                                    tiempoSesion,
                                    null,
                                    dniPaciente

                            );

                            insertadasArchivo++;

                        }

                    }

                }

                totalInsertadas += insertadasArchivo;
                totalSaltadas += saltadasArchivo;
                totalPacientesCreados += pacientesCreadosArchivo;

                System.out.println("Archivo terminado: " + file.getName());
                System.out.println("Pacientes pendientes creados: " + pacientesCreadosArchivo);
                System.out.println("Sesiones insertadas: " + insertadasArchivo);
                System.out.println("Sesiones ya existentes saltadas/actualizadas: " + saltadasArchivo);

            } catch (Exception e) {

                System.err.println("Error processing file: " + file.getName());
                e.printStackTrace();

            }

        }

        System.out.println("All files processed.");
        System.out.println("Total pacientes pendientes creados: " + totalPacientesCreados);
        System.out.println("Total sesiones insertadas: " + totalInsertadas);
        System.out.println("Total sesiones ya existentes saltadas/actualizadas: " + totalSaltadas);

    }

    private boolean sesionYaExiste(String idSesion) {

        String sql = "SELECT COUNT(*) FROM SESION WHERE ID_SESION = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, idSesion);

        return count != null && count > 0;

    }

    private String crearDniPacienteAutomatico(String userId) {

        String limpio = userId
                .toUpperCase()
                .replaceAll("[^A-Z0-9]", "_");

        return "AUTO_" + limpio;

    }

    private boolean insertarPacientePendienteSiNoExiste(String dniPaciente, String nombrePaciente) {

        String sqlExiste = "SELECT COUNT(*) FROM PACIENTE WHERE DNI_PACIENTE = ?";

        Integer count = jdbcTemplate.queryForObject(sqlExiste, Integer.class, dniPaciente);

        if (count != null && count > 0) {

            return false;

        }

        String sqlInsert = "INSERT INTO PACIENTE " +
                "(DNI_PACIENTE, NOMBRE, APELLIDOS, DOMICILIO, EMAIL, TELEFONO, EDAD, LOCALIDAD, DATOS_COMPLETOS, DNI_FISIO) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sqlInsert,

                dniPaciente,
                nombrePaciente,
                "Pendiente",
                "Pendiente",
                "pendiente@pendiente.com",
                0,
                null,
                "Pendiente",
                0,
                null

        );

        System.out.println("Paciente pendiente creado: " + nombrePaciente + " (" + dniPaciente + ")");

        return true;

    }

    private void actualizarPacienteSesionSiHaceFalta(String idSesion, String dniPaciente) {

        String sql = "UPDATE SESION " +
                "SET DNI_PACIENTE = ? " +
                "WHERE ID_SESION = ? AND DNI_PACIENTE IS NULL";

        jdbcTemplate.update(sql, dniPaciente, idSesion);

    }

}