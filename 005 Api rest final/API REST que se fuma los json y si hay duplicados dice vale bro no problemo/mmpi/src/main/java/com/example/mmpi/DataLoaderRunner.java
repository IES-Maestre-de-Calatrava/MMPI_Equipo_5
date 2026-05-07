package com.example.mmpi;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoaderRunner implements CommandLineRunner {

    private final JsonToSQLService service;

    public DataLoaderRunner(JsonToSQLService service) {
        this.service = service;
    }

    @Override
    public void run(String... args) {
        service.loadJsonToDatabase();
    }
}