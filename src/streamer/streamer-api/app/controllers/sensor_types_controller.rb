class SensorTypesController < ApplicationController
  before_action :set_sensor_type, only: %i[ show update destroy ]

  # GET /sensor_types
  def index
    @sensor_types = SensorType.all

    render json: @sensor_types
  end

  # GET /sensor_types/1
  def show
    render json: @sensor_type
  end

  # POST /sensor_types
  def create
    @sensor_type = SensorType.new(sensor_type_params)

    if @sensor_type.save
      render json: @sensor_type, status: :created, location: @sensor_type
    else
      render json: @sensor_type.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /sensor_types/1
  def update
    if @sensor_type.update(sensor_type_params)
      render json: @sensor_type
    else
      render json: @sensor_type.errors, status: :unprocessable_entity
    end
  end

  # DELETE /sensor_types/1
  def destroy
    @sensor_type.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sensor_type
      @sensor_type = SensorType.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def sensor_type_params
      params.require(:sensor_type).permit(:name, :description)
    end
end
