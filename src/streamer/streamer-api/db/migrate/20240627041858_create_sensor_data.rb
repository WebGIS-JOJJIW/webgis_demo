class CreateSensorData < ActiveRecord::Migration[7.1]
  def change
    create_table :sensor_data do |t|
      t.references :sensor, foreign_key: {on_delete: :cascade}
      t.string :sensor_name, index: true
      t.float :lat
      t.float :lon
      t.references :sensor_type, foreign_key: {on_delete: :nullify}
      t.string :sensor_type_name, index: true
      t.references :region, foreign_key: {on_delete: :nullify}
      t.string :region_name, index: true
      t.references :data_type, foreign_key: {on_delete: :nullify}
      t.string :data_type_name, index: true
      t.string :value
      t.datetime :dt
      t.string :dt_year, index: true
      t.string :dt_yearmon, index: true
      t.bigint :dt_epoch
      t.string :partition_yearmon, index: true

      t.timestamps
    end
  end
end
