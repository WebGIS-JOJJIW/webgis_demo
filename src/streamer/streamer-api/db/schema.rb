# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_06_27_041858) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "data_types", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_data_types_on_name"
  end

  create_table "regions", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_regions_on_name"
  end

  create_table "sensor_data", force: :cascade do |t|
    t.bigint "sensor_id"
    t.string "sensor_name"
    t.float "lat"
    t.float "lon"
    t.bigint "sensor_type_id"
    t.string "sensor_type_name"
    t.bigint "region_id"
    t.string "region_name"
    t.bigint "data_type_id"
    t.string "data_type_name"
    t.string "value"
    t.datetime "dt"
    t.string "dt_year"
    t.string "dt_yearmon"
    t.bigint "dt_epoch"
    t.string "partition_yearmon"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["data_type_id"], name: "index_sensor_data_on_data_type_id"
    t.index ["data_type_name"], name: "index_sensor_data_on_data_type_name"
    t.index ["dt_year"], name: "index_sensor_data_on_dt_year"
    t.index ["dt_yearmon"], name: "index_sensor_data_on_dt_yearmon"
    t.index ["partition_yearmon"], name: "index_sensor_data_on_partition_yearmon"
    t.index ["region_id"], name: "index_sensor_data_on_region_id"
    t.index ["region_name"], name: "index_sensor_data_on_region_name"
    t.index ["sensor_id"], name: "index_sensor_data_on_sensor_id"
    t.index ["sensor_name"], name: "index_sensor_data_on_sensor_name"
    t.index ["sensor_type_id"], name: "index_sensor_data_on_sensor_type_id"
    t.index ["sensor_type_name"], name: "index_sensor_data_on_sensor_type_name"
  end

  create_table "sensor_types", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_sensor_types_on_name"
  end

  create_table "sensors", force: :cascade do |t|
    t.string "name"
    t.bigint "sensor_type_id"
    t.float "lat"
    t.float "lon"
    t.bigint "region_id"
    t.string "poi_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_sensors_on_name"
    t.index ["poi_id"], name: "index_sensors_on_poi_id"
    t.index ["region_id"], name: "index_sensors_on_region_id"
    t.index ["sensor_type_id"], name: "index_sensors_on_sensor_type_id"
  end

  add_foreign_key "sensor_data", "data_types", on_delete: :nullify
  add_foreign_key "sensor_data", "regions", on_delete: :nullify
  add_foreign_key "sensor_data", "sensor_types", on_delete: :nullify
  add_foreign_key "sensor_data", "sensors", on_delete: :cascade
  add_foreign_key "sensors", "regions", on_delete: :nullify
  add_foreign_key "sensors", "sensor_types", on_delete: :nullify
end
