import React, { useState } from 'react';
import { Input, Button, Card, Typography } from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();

    // State for the form inputs
    const [shippingDetails, setShippingDetails] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expirationDate: '',
        cvv: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    // Handle input changes
    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingDetails({ ...shippingDetails, [name]: value });
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentDetails({ ...paymentDetails, [name]: value });
    };

    // Confirm checkout
    const handleConfirm = () => {
        if (!shippingDetails.name || !paymentDetails.cardNumber) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        // Simulate API call for checkout
        alert('Order confirmed!');

        // Navigate to confirmation page
        navigate('/confirmation');
    };

    return (
        <Card className="mx-auto max-w-lg p-6">
            <Typography variant="h4" color="blue-gray" className="mb-4">
                Checkout
            </Typography>

            <section>
                <Typography variant="h5" className="mb-2">
                    Shipping Address
                </Typography>
                <div className="space-y-4">
                    <div className="mb-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={shippingDetails.name}
                            onChange={handleShippingChange}
                            color="blue"
                            size="lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            label="Address"
                            name="address"
                            value={shippingDetails.address}
                            onChange={handleShippingChange}
                            color="blue"
                            size="lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            label="City"
                            name="city"
                            value={shippingDetails.city}
                            onChange={handleShippingChange}
                            color="blue"
                            size="lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            label="State"
                            name="state"
                            value={shippingDetails.state}
                            onChange={handleShippingChange}
                            color="blue"
                            size="lg"
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="ZIP Code"
                            name="zip"
                            value={shippingDetails.zip}
                            onChange={handleShippingChange}
                            color="blue"
                            size="lg"
                            required
                        />
                    </div>
                </div>
            </section>

            <section className="mt-6">
                <Typography variant="h5" className="mb-2">
                    Payment Details
                </Typography>
                <div className="space-y-4">
                    <div className="mb-4">
                    <Input
                        label="Card Number"
                        name="cardNumber"
                        className="mb-2"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentChange}
                        color="blue"
                        size="lg"
                        required
                        />
                    </div>
                    <div className="mb-4">
                    <Input
                        label="Expiration Date"
                        name="expirationDate"
                        value={paymentDetails.expirationDate}
                        onChange={handlePaymentChange}
                        color="blue"
                        size="lg"
                        required
                        placeholder="MM/YY"
                        />
                    </div>
                    <div className="mb-4">
                    <Input
                        label="CVV"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handlePaymentChange}
                        color="blue"
                        size="lg"
                        required
                        />
                    </div>
                </div>
            </section>

            {errorMessage && (
                <Typography variant="small" color="red" className="mt-4">
                    {errorMessage}
                </Typography>
            )}

            <Button
                className="mt-6"
                color="blue"
                onClick={handleConfirm}
                fullWidth
            >
                Confirm Order
            </Button>
        </Card>
    );
};

export default CheckoutPage;
