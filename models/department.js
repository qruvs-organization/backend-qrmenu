module.exports = function (sequelize, DataTypes) {
  const Department = sequelize.define(
    "department",
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
      color_theme: {
        type: DataTypes.ENUM,
        defaultValue: "white",
        values: ["dark", "white"], 
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: "mnt",
      },
      symbol: {
        type: DataTypes.STRING(10),
      },
      logo: {
        type: DataTypes.STRING(100)
      },
      background: {
        type: DataTypes.STRING(256)
      },
      wifi_name: {
        type: DataTypes.STRING(256)
      },
      wifi_code: {
        type: DataTypes.STRING(50)
      },
      country: {
        type: DataTypes.STRING(100)
      },
      city: {
        type: DataTypes.STRING(100)
      },
      address: {
        type: DataTypes.STRING(100)
      },
      googlemaps_link: {
        type: DataTypes.STRING(100)
      },
      instagram: {
        type: DataTypes.STRING(100)
      },
      facebook: {
        type: DataTypes.STRING(100)
      },
      twiter: {
        type: DataTypes.STRING(100)
      },
      ispaid: { 
        type: DataTypes.BOOLEAN,
        defaultValue:false
      },
      is_price_visible:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
      },
      expired_date:{
        type:DataTypes.DATE
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue:false
      },
      type: {
        type: DataTypes.STRING(45)//hotel, food, etc 
      },
      pay_type: {
        type: DataTypes.STRING(45)//mini, standart, premium 
      },
      userId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "department",
      timestamps: true,
    }
  );
  return Department;
};
