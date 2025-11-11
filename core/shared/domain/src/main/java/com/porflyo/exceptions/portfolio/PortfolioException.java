package com.porflyo.exceptions.portfolio;

import com.porflyo.exceptions.shared.DomainException;

public abstract class PortfolioException extends DomainException {
    protected PortfolioException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}
