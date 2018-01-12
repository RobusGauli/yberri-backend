let tree= {
  categories: {
    Drink: [
      {
        name: 'Lemon Juice',
        price: 300,

      },
      {
        name: 'Tea',
        price: 500,
      }
    ],
    BreakFast: [
      {
        name: 'sandhsiw',
        price: 200,
      },
      {
        name:'mina',
        masala: 'asd',
      }
    ]
  },
}

const findCategories = (t) => {
  return Object.keys(t.categories);
}

const findItemsByCategory = (t, name) => {
  return t.categories[name];
}

console.log(findCategories(tree));
console.log(findItemsByCategory(tree, 'BreakFat'))