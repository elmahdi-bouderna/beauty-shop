import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSortAmountDown, FaChevronDown } from 'react-icons/fa';

const SortSelector = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const sortOptions = [
    { value: 'newest', label: t('sort.newest') },
    { value: 'price_asc', label: t('sort.priceLowToHigh') },
    { value: 'price_desc', label: t('sort.priceHighToLow') },
    { value: 'discount', label: t('sort.biggestDiscount') },
    { value: 'name_asc', label: t('sort.nameAZ') },
    { value: 'name_desc', label: t('sort.nameZA') },
  ];
  
  const selectedOption = sortOptions.find(option => option.value === value) || sortOptions[0];
  
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center py-2 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
      >
        <FaSortAmountDown className="mr-2 text-gray-500" />
        <span className="mr-1">{t('sort.sortBy')}:</span>
        <span className="font-medium">{selectedOption.label}</span>
        <FaChevronDown className="ml-2 text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {sortOptions.map(option => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    option.value === value ? 'bg-gray-50 text-primary font-medium' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SortSelector;