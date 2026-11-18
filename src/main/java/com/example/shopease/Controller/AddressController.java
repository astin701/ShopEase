package com.example.shopease.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shopease.DTO.AddressRequestDTO;
import com.example.shopease.DTO.AddressResponseDTO;
import com.example.shopease.Service.AddressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/addresses/user")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // Add Address
    @PostMapping
    public ResponseEntity<AddressResponseDTO> addAddress(
            @Valid @RequestBody AddressRequestDTO address,
            Authentication authentication) {

        String email = authentication.getName();

        return addressService.addAddress(email, address);
    }

    // Get All Addresses
    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAllAddresses(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(addressService.getAllAddresses(email));
    }

    // Get Address By ID
    @GetMapping("/{addressId}")
    public AddressResponseDTO getAddressById(
            @PathVariable Long addressId,
            Authentication authentication) {

        String email = authentication.getName();

        return addressService.getAddressById(email, addressId);
    }

    // Update Address
    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequestDTO updatedAddress,
            Authentication authentication) {

        String email = authentication.getName();

        return addressService.updateAddress(email, addressId, updatedAddress);
    }

    // Delete Address
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {

        String email = authentication.getName();

        return addressService.deleteAddress(email, addressId);
    }
}