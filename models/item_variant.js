module.exports = function (sequelize, DataTypes) {
  const ItemVariant = sequelize.define(
    "item_variant",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Та нэрээ оруулна уу",
          },
        },
      },
      due_variant:{
        type:DataTypes.DATE
      },
      price: {
        type: DataTypes.INTEGER
      },
      menuItemId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "menu_item",
          key: "id",
        },
      },
    },
    {
      tableName: "item_variant",
      timestamps: true,
    }
  );
  return ItemVariant;
};
