package com.example.shopease.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.example.shopease.DTO.AddressRequestDTO;
import com.example.shopease.DTO.AddressResponseDTO;
import com.example.shopease.Entity.AddressEntity;
import com.example.shopease.Entity.UserEntity;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.AddressRepository;
import com.example.shopease.Repository.UserRepository;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    // =================================
    // CONSTRUCTOR
    // =================================

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // =================================
    // CONVERT ENTITY TO DTO
    // =================================

    private AddressResponseDTO convertToDTO(AddressEntity address) {

        return new AddressResponseDTO(
                address.getId(),
                address.getUser().getId(),
                address.getFullName(),
                address.getPhoneNumber(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.getCountry(),
                address.getAddressType(),
                address.isDefaultAddress(),
                address.getCreatedAt()
        );
    }

    // =================================
    // ADD ADDRESS
    // =================================

    public ResponseEntity<AddressResponseDTO> addAddress(
            String email,
            AddressRequestDTO addressRequest) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));

        AddressEntity address = new AddressEntity();

        address.setFullName(addressRequest.getFullName());
        address.setPhoneNumber(addressRequest.getPhoneNumber());
        address.setAddressLine1(addressRequest.getAddressLine1());
        address.setAddressLine2(addressRequest.getAddressLine2());
        address.setCity(addressRequest.getCity());
        address.setState(addressRequest.getState());
        address.setPincode(addressRequest.getPincode());
        address.setCountry(addressRequest.getCountry());
        address.setAddressType(addressRequest.getAddressType());
        address.setDefaultAddress(addressRequest.isDefaultAddress());

        address.setUser(user);

        AddressEntity savedAddress = addressRepository.save(address);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(savedAddress));
    }

    // =================================
    // GET ALL ADDRESSES
    // =================================

    public List<AddressResponseDTO> getAllAddresses(String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));

        return addressRepository.findByUserIdAndDeletedFalse(user.getId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =================================
    // GET ADDRESS BY ID
    // =================================

    public AddressResponseDTO getAddressById(
            String email,
            Long addressId) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));

        AddressEntity address = addressRepository
                .findByIdAndUserIdAndDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with ID: " + addressId
                ));

        return convertToDTO(address);
    }

    // =================================
    // UPDATE ADDRESS
    // =================================

    public ResponseEntity<AddressResponseDTO> updateAddress(
            String email,
            Long addressId,
            AddressRequestDTO updatedAddress) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));

        AddressEntity address = addressRepository
                .findByIdAndUserIdAndDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with ID: " + addressId
                ));

        address.setFullName(updatedAddress.getFullName());
        address.setPhoneNumber(updatedAddress.getPhoneNumber());
        address.setAddressLine1(updatedAddress.getAddressLine1());
        address.setAddressLine2(updatedAddress.getAddressLine2());
        address.setCity(updatedAddress.getCity());
        address.setState(updatedAddress.getState());
        address.setPincode(updatedAddress.getPincode());
        address.setCountry(updatedAddress.getCountry());
        address.setAddressType(updatedAddress.getAddressType());
        address.setDefaultAddress(updatedAddress.isDefaultAddress());

        AddressEntity savedAddress = addressRepository.save(address);

        return ResponseEntity.ok(convertToDTO(savedAddress));
    }

    // =================================
    // DELETE ADDRESS
    // =================================

    public ResponseEntity<Void> deleteAddress(
            String email,
            Long addressId) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));

        AddressEntity address = addressRepository
                .findByIdAndUserIdAndDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with ID: " + addressId
                ));

        address.setDeleted(true);
        address.setDefaultAddress(false);

        addressRepository.save(address);

        return ResponseEntity.noContent().build();
    }

}