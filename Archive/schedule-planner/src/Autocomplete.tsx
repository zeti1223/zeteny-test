import React, { useState } from 'react';

const Autocomplete = ({ options, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    const userInput = e.currentTarget.value;
    const filteredSuggestions = options.filter(
      (option) =>
        option.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );
    setInputValue(userInput);
    setSuggestions(filteredSuggestions);
    setShowSuggestions(true);
    onChange(userInput); // Also update parent form state on every keystroke
  };

  const handleClick = (suggestion) => {
    setInputValue(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(suggestion);
  };

  const SuggestionsListComponent = () => {
    return suggestions.length ? (
      <ul className="absolute top-full left-0 right-0 border border-gray-300 dark:border-gray-600 rounded-b-md list-none mt-0 max-h-60 overflow-y-auto pl-0 bg-white dark:bg-gray-700 z-[1001] shadow-lg">
        {suggestions.map((suggestion) => {
          return (
            <li
              key={suggestion}
              onClick={() => handleClick(suggestion)}
              className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            >
              {suggestion}
            </li>
          );
        })}
      </ul>
    ) : (
      <div className="text-gray-500 dark:text-gray-400 p-3 absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-b-md z-[1001] shadow-lg">
        <em>Nincs találat.</em>
      </div>
    );
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
        value={inputValue}
        placeholder={placeholder}
      />
      {showSuggestions && inputValue && <SuggestionsListComponent />}
    </div>
  );
};

export default Autocomplete;