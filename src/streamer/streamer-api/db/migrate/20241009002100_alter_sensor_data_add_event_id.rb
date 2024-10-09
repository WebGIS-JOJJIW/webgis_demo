class AlterSensorDataAddEventId < ActiveRecord::Migration[7.1]
  def change
    add_column :sensor_data, :event_id, :string
    add_index :sensor_data, :event_id
  end
end
