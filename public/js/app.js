import esm from 'esm';
const require = esm(module);
const index = require('./index.js');
const gatherPerformanceData = index.gatherPerformanceData;


window.onload = function() {
    console.log('This is being recognised')
    // Get the form and input elements
    const form = document.getElementById('formData');
    const input = document.getElementById('URLList');
    // Add a submit event listener to the form
    form.addEventListener('submit', async function(event) {
      // Prevent the default form submission behavior
      event.preventDefault();
  
      // Get the value of the input field
      const value = input.value;
      const test = await gatherPerformanceData(value)
      console.log(test)
      // Display the value in an alert
      alert(`You entered: ${value}`);
    });
  };