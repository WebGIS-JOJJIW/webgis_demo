class SensorDataController < ApplicationController
  before_action :set_sensor_data, only: %i[ show update destroy ]

  # GET /sensor_data
  def index
    @sensor_data = SensorData.all

    render json: @sensor_data
  end

  # GET /sensor_data/1
  def show
    render json: @sensor_data
  end

  # POST /sensor_data
  def create
    @sensor_data = SensorData.new(sensor_data_params)

    if @sensor_data.save
      render json: @sensor_data, status: :created, location: @sensor_data
    else
      render json: @sensor_data.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /sensor_data/1
  def update
    if @sensor_data.update(sensor_data_params)
      render json: @sensor_data
    else
      render json: @sensor_data.errors, status: :unprocessable_entity
    end
  end

  # DELETE /sensor_data/1
  def destroy
    @sensor_data.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sensor_data
      @sensor_data = SensorData.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def sensor_data_params
      params.require(:sensor_data).permit(:sensor_id, :sensor_name, :lat, :lon, :sensor_type_id, :sensor_type_name, :region_id, :region_name, :data_type_id, :data_type_name, :value, :dt, :dt_year, :dt_yearmon, :dt_epoch, :partition_yearmon)
    end
end
