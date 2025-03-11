module.exports = function (sequelize, DataTypes) {
  const MenuItem = sequelize.define(
    "menu_item",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      item_name: {
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
      weight: {
        type: DataTypes.STRING(100)
      },
      item_visible:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      },
      item_avialable:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
      },
      image: {
        type: DataTypes.STRING(100)
      },
      category_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "category",
          key: "id",
        },
      },
    },
    {
      tableName: "menu_item",
      timestamps: true,
    }
  );
  return MenuItem;
};
