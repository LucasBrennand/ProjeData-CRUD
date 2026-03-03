package com.lucas.projedatacrud.controller;

import com.lucas.projedatacrud.dto.ProductionSuggestionDTO;
import com.lucas.projedatacrud.service.ProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "*")
public class ProductionController {

    @Autowired
    private ProductionService service;

    @GetMapping("/suggested")
    public List<ProductionSuggestionDTO> getSuggestions() {
        return service.calculateSuggestedProduction();
    }
}