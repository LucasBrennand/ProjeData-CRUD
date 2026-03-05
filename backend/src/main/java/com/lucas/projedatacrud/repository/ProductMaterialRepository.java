package com.lucas.projedatacrud.repository;

import com.lucas.projedatacrud.model.ProductMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface ProductMaterialRepository extends JpaRepository<ProductMaterial, Integer> {
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ProductMaterial pm WHERE pm.rawMaterial.id = :rawMaterialId")
    void deleteByRawMaterialId(Integer rawMaterialId);
}
