package com.ajith.store.application.common;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final int MIN_LENGTH = 6;
    private static final String UPPERCASE_PATTERN = ".*[A-Z].*";
    private static final String LOWERCASE_PATTERN = ".*[a-z].*";
    private static final String DIGIT_PATTERN = ".*\\d.*";
    private static final String SPECIAL_PATTERN = ".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*";

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }

        context.disableDefaultConstraintViolation();

        if (password.length() < MIN_LENGTH) {
            context.buildConstraintViolationWithTemplate(
                "Password must be at least " + MIN_LENGTH + " characters long")
                .addConstraintViolation();
            return false;
        }
        if (!password.matches(UPPERCASE_PATTERN)) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one uppercase letter")
                .addConstraintViolation();
            return false;
        }
        if (!password.matches(LOWERCASE_PATTERN)) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one lowercase letter")
                .addConstraintViolation();
            return false;
        }
        if (!password.matches(DIGIT_PATTERN)) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one digit")
                .addConstraintViolation();
            return false;
        }
        if (!password.matches(SPECIAL_PATTERN)) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one special character")
                .addConstraintViolation();
            return false;
        }

        return true;
    }
}
