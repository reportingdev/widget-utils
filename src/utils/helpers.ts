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

export {
  containsAllZeros,
  convertPxToNumber,
  generateDropdownValues
};

