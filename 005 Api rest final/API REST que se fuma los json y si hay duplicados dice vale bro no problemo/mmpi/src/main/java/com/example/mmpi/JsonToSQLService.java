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

    	String sql = "INSERT INTO SESION " +
    	        "(ID_SESION, NOMBRE_PACIENTE, ACELERACIONES_BRUSCAS, COLISIONES, ESTABILIDAD, NIVEL, PARADAS_BRUSCAS, SCORE, TIEMPO_MOVIMIENTO, TIEMPO_SESION, DNI_FISIO, DNI_PACIENTE, ID_DISPOSITIVO) " +
    	        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

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

        for (File file : files) {

            System.out.println("Processing file: " + file.getName());

            try {
                JsonNode root = mapper.readTree(file);

                Iterator<String> userIds = root.fieldNames();

                while (userIds.hasNext()) {
                    String userId = userIds.next();
                    JsonNode userNode = root.get(userId);

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
                            String nombrePaciente = userId;

                            int aceleraciones = data.get("aceleraciones_bruscas").asInt();
                            int colisiones = data.get("colisiones").asInt();
                            int estabilidad = data.get("estabilidad").asInt();
                            String nivel = data.get("nivel").asText();
                            int paradas = data.get("paradas_bruscas").asInt();
                            int score = data.get("score").asInt();

                            int tiempoMovimiento = (int) (data.get("tiempo_movimiento").asLong() / 1000);

                            long rawTimestamp = data.get("timestamp").asLong();

                            Timestamp tiempoSesion = new Timestamp(rawTimestamp * 1000
                            );

                            jdbcTemplate.update(sql,
                                    idSesion,
                                    nombrePaciente,
                                    aceleraciones,
                                    colisiones,
                                    estabilidad,
                                    nivel,
                                    paradas,
                                    score,
                                    tiempoMovimiento,
                                    tiempoSesion,
                                    null,
                                    null,
                                    null
                            );
                        }
                    }
                }

            } catch (Exception e) {
                System.err.println("Error processing file: " + file.getName());
                e.printStackTrace();
            }
        }

        System.out.println("All files processed.");
    }
}