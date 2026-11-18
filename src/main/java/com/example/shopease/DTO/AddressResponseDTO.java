package com.example.shopease.DTO;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AddressResponseDTO {

    private Long id;

    private Long userId;
    
    @NotBlank (message = "Name is required")
    private String fullName;

    @NotBlank (message = "Phone number is required")
    @Pattern (regexp = "^[6-9][0-9]{9}$", message = "Please enter a valid 10-digit Indian mobile number")
    private String phoneNumber;

    @NotBlank (message = "Address is required")
    private String addressLine1;

    private String addressLine2;

    @NotBlank (message = "City is required")
    private String city;

    @NotBlank (message = "State is required")
    private String state;

    @NotBlank (message = "Pincode is required")
    @Pattern (regexp = "^[1-9][0-9]{5}$", message = "Please enter a valid pincode")
    private String pincode;

    @NotBlank (message = "Country is required")
    private String country;

    @NotBlank (message = "Address type is required")
    private String addressType;

    private boolean defaultAddress;

    private LocalDateTime createdAt;

    public AddressResponseDTO(){
    }

    public AddressResponseDTO(Long id, Long userId, String fullName, String phoneNumber, String addressLine1, String addressLine2, String city, String state, String pincode, String country, String addressType, boolean defaultAddress, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.country = country;
        this.addressType = addressType;
        this.defaultAddress = defaultAddress;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public boolean isDefaultAddress() {
        return defaultAddress;
    }

    public void setDefaultAddress(boolean defaultAddress) {
        this.defaultAddress = defaultAddress;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}