module.exports = function (sequelize, DataTypes) {
  const Menu = sequelize.define(
    "menu",
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
      is_visible:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      },
      departmentId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "department",
          key: "id",
        },
      },
    },
    {
      tableName: "menu",
      timestamps: true,
    }
  );
  return Menu;
};
