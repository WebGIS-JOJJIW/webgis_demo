class CreateSensorTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :sensor_types do |t|
      t.string :name, index: true
      t.string :description

      t.timestamps
    end
  end
end
