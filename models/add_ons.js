module.exports = function (sequelize, DataTypes) {
  const AddOns = sequelize.define(
    "add_ons",
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
      price: {
        type: DataTypes.FLOAT
      },
      item:{
          type: DataTypes.ENUM("single", "multiple"),
          defaultValue: "single",
      },
      menu_itemId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "menu_item",
          key: "id",
        },
      },
    },
    {
      tableName: "add_ons",
      timestamps: true,
    }
  );
  return AddOns;
};
