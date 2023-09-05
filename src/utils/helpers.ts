const containsAllZeros = (test:string) => {
  const numbers = ['1','2','3','4','5','6','7','8','9'];
  for(let i=0;i<test.length;i++) {
    const char = test[i];
    if(numbers.includes(char)) {
      return false;
    }
  }
  return true;
}

const convertPxToNumber = (value:string) =>{
  if(value.endsWith('px')) {
    value = value.slice(0, -2)
  }
  return +value;
}

const generateDropdownValues = (data:WidgetData) => {
  const { datasets,dimension } = data;

  if (!datasets || datasets.length === 0) {
    return [];
  }

  const labelsDataset = datasets[0].data;
  const valuesDataset = dimension?.data ?? labelsDataset 

  return labelsDataset.map((label, index) => {
    return {
      label: label,
      value: valuesDataset[index]
    };
  });
}

const downloadCSV = (data:any, format='widgetData') => {
  let csvContent = "";

// Function to convert array to CSV string
const arrayToCsv = (arr: any[][]) => {
  return arr.map(row => row.join(",")).join("\n");
};

switch (format) {
  case '2dArray':
    csvContent += arrayToCsv(data);
    break;

  case 'widgetData':
    // Determine the longest dataset
    let maxLen = 0;
    for (const dataset of data.datasets) {
      maxLen = Math.max(maxLen, dataset.data.length);
    }
    if (data.dimension) {
      maxLen = Math.max(maxLen, data.dimension.data.length);
    }

    // Prepare header labels
    const headerLabels = data.datasets.map((dataset: Dataset) => dataset.label);
    if (data.dimension) {
      headerLabels.unshift(data.dimension.label);
    }
    csvContent += headerLabels.join(",") + "\n";

    // Prepare the data rows
    for (let i = 0; i < maxLen; i++) {
      const row = [];

      // Add dimension data first, if it exists
      if (data.dimension) {
        row.push(data.dimension.data[i] || "");
      }

      // Add dataset data
      for (const dataset of data.datasets) {
        row.push(dataset.data[i] || "");
      }

      csvContent += row.join(",") + "\n";
    }
    break;

  default:
    console.error("Invalid data format");
    return;
}
  
  const csvFile = new Blob([csvContent], { type: 'text/csv' });
  const downloadLink = document.createElement('a');
  downloadLink.download = 'data.csv';
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export {
  containsAllZeros,
  convertPxToNumber,
  generateDropdownValues,
  downloadCSV
};

