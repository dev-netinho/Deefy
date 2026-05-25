package br.com.deefy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DeefyApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeefyApplication.class, args);
	}

}