package com.lucas.projedatacrud.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductionSuggestionDTO {
    private String productName;
    private Integer quantityToProduce;
    private Double totalValue;
}