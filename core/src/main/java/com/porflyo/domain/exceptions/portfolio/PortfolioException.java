package com.porflyo.domain.exceptions.portfolio;

import com.porflyo.domain.exceptions.shared.DomainException;

public abstract class PortfolioException extends DomainException {
    protected PortfolioException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}
