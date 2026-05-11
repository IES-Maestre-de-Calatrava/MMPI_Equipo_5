package com.example.mmpi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

        String sqlSesion =
                "INSERT INTO SESION " +
                "(ID_SESION, NOMBRE_PACIENTE, ACELERACIONES_BRUSCAS, COLISIONES, ESTABILIDAD, NIVEL, PARADAS_BRUSCAS, SCORE, TIEMPO_MOVIMIENTO, AÑO_SESION, MES_SESION, DIA_SESION, TIEMPO_SESION, DNI_FISIO, DNI_PACIENTE) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

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

        for (File file : files) {

            System.out.println("Processing file: " + file.getName());

            int insertadasArchivo = 0;

            try {

                JsonNode root = mapper.readTree(file);
                Iterator<String> userIds = root.fieldNames();

                while (userIds.hasNext()) {

                    String userId = userIds.next();
                    JsonNode userNode = root.get(userId);

                    String dniPaciente = crearDniPacienteAutomatico(userId);
                    insertarPacientePendienteSiNoExiste(dniPaciente, userId);

                    JsonNode sesionesNode = userNode.get("sesiones");
                    if (sesionesNode == null) continue;

                    Iterator<String> fechas = sesionesNode.fieldNames();

                    while (fechas.hasNext()) {

                        String fechaKey = fechas.next();
                        JsonNode sesionesDia = sesionesNode.get(fechaKey);

                        Iterator<String> sesiones = sesionesDia.fieldNames();

                        while (sesiones.hasNext()) {

                            String idSesion = sesiones.next();
                            JsonNode data = sesionesDia.get(idSesion);

                            int aceleraciones = data.get("aceleraciones_bruscas").asInt();
                            int colisiones = data.get("colisiones").asInt();
                            int estabilidad = data.get("estabilidad").asInt();
                            String nivel = data.get("nivel").asText();
                            int paradas = data.get("paradas_bruscas").asInt();
                            int score = data.get("score").asInt();

                            int tiempoMovimiento =
                                    (int) (data.get("tiempo_movimiento").asLong() / 1000);

                            // ✅ FIXED: proper timestamp conversion
                            LocalDateTime fechaHora =
                                    Instant.ofEpochSecond(data.get("timestamp").asLong())
                                            .atZone(ZoneId.systemDefault())
                                            .toLocalDateTime();

                            int anio = fechaHora.getYear();
                            int mes = fechaHora.getMonthValue();
                            int dia = fechaHora.getDayOfMonth();

                            jdbcTemplate.update(sqlSesion,
                                    idSesion,
                                    userId,
                                    aceleraciones,
                                    colisiones,
                                    estabilidad,
                                    nivel,
                                    paradas,
                                    score,
                                    tiempoMovimiento,
                                    anio,
                                    mes,
                                    dia,
                                    fechaHora,
                                    null,
                                    dniPaciente
                            );

                            insertadasArchivo++;
                        }
                    }
                }

                totalInsertadas += insertadasArchivo;

                System.out.println("File finished: " + file.getName());
                System.out.println("Inserted: " + insertadasArchivo);

            } catch (Exception e) {
                System.err.println("Error processing file: " + file.getName());
                e.printStackTrace();
            }
        }

        System.out.println("All files processed.");
        System.out.println("Total inserted sessions: " + totalInsertadas);
    }

    private String crearDniPacienteAutomatico(String userId) {
        return "AUTO_" + userId.toUpperCase().replaceAll("[^A-Z0-9]", "_");
    }

    private boolean insertarPacientePendienteSiNoExiste(String dniPaciente, String nombrePaciente) {

        String sqlExiste =
                "SELECT COUNT(*) FROM PACIENTE WHERE DNI_PACIENTE = ?";

        Integer count = jdbcTemplate.queryForObject(sqlExiste, Integer.class, dniPaciente);

        if (count != null && count > 0) return false;

        String sqlInsert =
                "INSERT INTO PACIENTE " +
                "(DNI_PACIENTE, NOMBRE, APELLIDOS, DOMICILIO, EMAIL, TELEFONO, EDAD, LOCALIDAD, DATOS_COMPLETOS, DNI_FISIO) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sqlInsert,
                dniPaciente,
                nombrePaciente,
                "Pendiente",
                "Pendiente",
                "pendiente@pendiente.com",
                "0",
                null,
                "Pendiente",
                0,
                null
        );

        System.out.println("Paciente created: " + nombrePaciente);
        return true;
    }
}