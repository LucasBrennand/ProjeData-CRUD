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
        rawMaterialRepository.findAll().forEach(rm -> {
            virtualStock.put(rm.getId(), rm.getQuantity());
        });

        List<ProductionSuggestionDTO> suggestions = new ArrayList<>();

        for (Product product : products) {
            System.out.println("--- Verificando Produto: " + product.getName() + " ---");
            System.out.println("Quantidade de materiais vinculados: " +
                    (product.getMaterials() != null ? product.getMaterials().size() : "NULO"));
            if (product.getMaterials() == null || product.getMaterials().isEmpty()) {
                continue;
            }

            int possibleToProduce = Integer.MAX_VALUE;

            for (ProductMaterial pm : product.getMaterials()) {
                Integer stockAvailable = virtualStock.get(pm.getRawMaterial().getId());

                if (stockAvailable == null || stockAvailable <= 0) {
                    possibleToProduce = 0;
                    break;
                }

                int canMake = stockAvailable / pm.getRequiredQuantity();
                possibleToProduce = Math.min(possibleToProduce, canMake);
            }

            if (possibleToProduce > 0 && possibleToProduce != Integer.MAX_VALUE) {
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