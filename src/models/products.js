
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products', {
    productId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      field: 'product_id'
    },
    parentId: {
      type: DataTypes.UUIDV4,
      field: 'parent_id'
    },
    init: {
      type: DataTypes.BOOLEAN
    },
    externalId: {
      type: DataTypes.TEXT,
      field: 'external_id'
    },
    searchText: {
      type: DataTypes.TEXT,
      field: 'search_text'
    },
    name: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL
    },
    image: {
      type: DataTypes.TEXT
    },
    jsonProduct: {
      type: DataTypes.JSONB,
      field: 'json_product'
    },
    sku: {
      type: DataTypes.TEXT
    },
    storeProductId: {
      type: DataTypes.TEXT,
      field: 'store_product_id'
    },
    createdAt: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'products'
  });
};
