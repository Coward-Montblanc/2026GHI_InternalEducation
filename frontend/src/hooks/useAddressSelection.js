import { useState } from 'react';

export const useAddressSelection = (setFormData) => {
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);

    const openAddrModal = () => setIsAddrModalOpen(true);
    const closeAddrModal = () => setIsAddrModalOpen(false);

    const handleSelectAddress = (selectedAddr) => {
        if (!setFormData) return;

        setFormData(prev => ({
            ...prev,
            receiver_name: selectedAddr.receiver_name,
            zip_code: selectedAddr.zip_code,
            address: selectedAddr.address,
            address_detail: selectedAddr.address_detail,
            phone: selectedAddr.phone,
        }));
        closeAddrModal();
    };

    return {
        isAddrModalOpen,
        openAddrModal,
        closeAddrModal,
        handleSelectAddress
    };
};
