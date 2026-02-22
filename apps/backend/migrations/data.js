"use strict";

const DEFAULT_ITEM_TYPES = [
  "T-Shirt",
  "Long Sleeve",
  "Hoodie",
  "Jacket",
  "Sweatshirt",
  "Tank Top",
];
const DEFAULT_ITEM_GENDERS = ["Men", "Women", "Kids"];
const DEFAULT_COLORS = ["Blue", "Red", "Orange", "Yellow", "Green", "Purple"];
const DEFAULT_ITEM_SIZES = ["S", "M", "L", "XL", "XXL"];

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS item_types (
        value VARCHAR(64) PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS item_genders (
        value VARCHAR(64) PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS colors (
        value VARCHAR(64) PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS item_sizes (
        value VARCHAR(64) PRIMARY KEY
      );
    `);

    for (const value of DEFAULT_ITEM_TYPES) {
      await queryInterface.sequelize.query(
        `INSERT INTO item_types(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
        { replacements: { value } },
      );
    }

    for (const value of DEFAULT_ITEM_GENDERS) {
      await queryInterface.sequelize.query(
        `INSERT INTO item_genders(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
        { replacements: { value } },
      );
    }

    for (const value of DEFAULT_COLORS) {
      await queryInterface.sequelize.query(
        `INSERT INTO colors(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
        { replacements: { value } },
      );
    }

    for (const value of DEFAULT_ITEM_SIZES) {
      await queryInterface.sequelize.query(
        `INSERT INTO item_sizes(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
        { replacements: { value } },
      );
    }
  },

  async down(queryInterface) {
    for (const value of DEFAULT_ITEM_TYPES) {
      await queryInterface.sequelize.query(
        `DELETE FROM item_types WHERE value = :value`,
        { replacements: { value } },
      );
    }

    for (const value of DEFAULT_ITEM_GENDERS) {
      await queryInterface.sequelize.query(
        `DELETE FROM item_genders WHERE value = :value`,
        { replacements: { value } },
      );
    }

    for (const value of DEFAULT_COLORS) {
      await queryInterface.sequelize.query(`DELETE FROM colors WHERE value = :value`, {
        replacements: { value },
      });
    }

    for (const value of DEFAULT_ITEM_SIZES) {
      await queryInterface.sequelize.query(
        `DELETE FROM item_sizes WHERE value = :value`,
        { replacements: { value } },
      );
    }
  },
};
