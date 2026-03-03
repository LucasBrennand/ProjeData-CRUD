package com.lucas.projedatacrud.service;

import com.lucas.projedatacrud.dto.ProductionSuggestionDTO;
import com.lucas.projedatacrud.model.*;
import com.lucas.projedatacrud.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProductionService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    public List<ProductionSuggestionDTO> calculateSuggestedProduction() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "price"));
        Map<Integer, Integer> virtualStock = new HashMap<>();
        rawMaterialRepository.findAll().forEach(rm -> virtualStock.put(rm.getId(), rm.getQuantity()));

        List<ProductionSuggestionDTO> suggestions = new ArrayList<>();

        for (Product product : products) {
            int possibleToProduce = Integer.MAX_VALUE;

            if (product.getMaterials() == null || product.getMaterials().isEmpty()) continue;

            for (ProductMaterial pm : product.getMaterials()) {
                int available = virtualStock.get(pm.getRawMaterial().getId());
                int canMakeWithThisMaterial = available / pm.getRequiredQuantity();
                possibleToProduce = Math.min(possibleToProduce, canMakeWithThisMaterial);
            }

            if (possibleToProduce > 0) {
                for (ProductMaterial pm : product.getMaterials()) {
                    int currentQty = virtualStock.get(pm.getRawMaterial().getId());
                    virtualStock.put(pm.getRawMaterial().getId(), currentQty - (possibleToProduce * pm.getRequiredQuantity()));
                }

                suggestions.add(new ProductionSuggestionDTO(
                        product.getName(),
                        possibleToProduce,
                        possibleToProduce * product.getPrice()
                ));
            }
        }
        return suggestions;
    }
}