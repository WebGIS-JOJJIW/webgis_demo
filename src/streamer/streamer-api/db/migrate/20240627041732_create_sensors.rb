class CreateSensors < ActiveRecord::Migration[7.1]
  def change
    create_table :sensors do |t|
      t.string :name, index: true
      t.references :sensor_type, foreign_key: {on_delete: :nullify}
      t.float :lat
      t.float :lon
      t.references :region, foreign_key: {on_delete: :nullify}
      t.string :poi_id, index: true

      t.timestamps
    end
  end
end
