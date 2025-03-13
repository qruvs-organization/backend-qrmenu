module.exports = function (sequelize, DataTypes) {
  const Category = sequelize.define(
    "category",
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
      description: {
        type: DataTypes.TEXT
      },
      is_visible:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      },
      photo: {
        type: DataTypes.STRING(100)
      },
      menuId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "menu",
          key: "id",
        },
      },
    },
    {
      tableName: "category",
      timestamps: true,
    }
  );
  return Category;
};
