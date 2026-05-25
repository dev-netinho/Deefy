package br.com.deefy.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerRedirectController {

    @GetMapping({
            "/api/v1/swagger-ui",
            "/api/v1/swagger-ui/",
            "/api/v1/swagger-ui/index.html"
    })
    public String redirectApiVersionedSwagger() {
        return "redirect:/swagger-ui/index.html";
    }
}
