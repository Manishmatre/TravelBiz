import React from 'react';
import Input from './Input';

function SearchInput({ value, onChange, placeholder = 'Search...', className = '', ...props }) {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

export default SearchInput; 