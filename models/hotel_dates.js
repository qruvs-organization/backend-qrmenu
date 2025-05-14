module.exports = function (sequelize, DataTypes) {
  const HotelOrderDate = sequelize.define(
    "hotel_order_dates",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      phone_number: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Та дугаараа оруулна уу",
          },
        },
      },
      start_date:{
        type:DataTypes.DATE
      },
      end_date:{
        type:DataTypes.DATE
      },
      itemVariantId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "item_variant",
          key: "id",
        },
      },
    },
    {
      tableName: "hotel_order_dates",
      timestamps: true,
    }
  );
  return HotelOrderDate;
};
