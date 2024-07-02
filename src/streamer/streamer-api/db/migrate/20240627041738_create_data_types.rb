class CreateDataTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :data_types do |t|
      t.string :name, index: true

      t.timestamps
    end
  end
end
