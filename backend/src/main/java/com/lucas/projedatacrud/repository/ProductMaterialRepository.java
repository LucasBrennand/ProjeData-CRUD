package com.lucas.projedatacrud.repository;

import com.lucas.projedatacrud.model.ProductMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ProductMaterialRepository extends JpaRepository<ProductMaterial, Integer> {

}
