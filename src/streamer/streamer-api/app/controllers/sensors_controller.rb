class SensorsController < ApplicationController
  before_action :set_sensor, only: %i[ update destroy ]

  # GET /sensors
  def index
    @sensors = Sensor.fetch_all params

    render json: @sensors
  end

  # GET /sensors/1
  def show
    render json: Sensor.fetch(params[:id])
  end

  # POST /sensors
  def create
    @sensor = Sensor.new(sensor_params)

    if @sensor.save
      render json: @sensor, status: :created, location: @sensor
    else
      render json: @sensor.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /sensors/1
  def update
    if @sensor.update(sensor_params)
      render json: @sensor
    else
      render json: @sensor.errors, status: :unprocessable_entity
    end
  end

  # DELETE /sensors/1
  def destroy
    @sensor.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sensor
      @sensor = Sensor.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def sensor_params
      params.require(:sensor).permit(:name, :sensor_type_id, :lat, :lon, :region_id, :poi_id)
    end
end
