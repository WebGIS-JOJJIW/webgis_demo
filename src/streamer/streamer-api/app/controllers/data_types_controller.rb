class DataTypesController < ApplicationController
  before_action :set_data_type, only: %i[ show update destroy ]

  # GET /data_types
  def index
    @data_types = DataType.all

    render json: @data_types
  end

  # GET /data_types/1
  def show
    render json: @data_type
  end

  # POST /data_types
  def create
    @data_type = DataType.new(data_type_params)

    if @data_type.save
      render json: @data_type, status: :created, location: @data_type
    else
      render json: @data_type.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /data_types/1
  def update
    if @data_type.update(data_type_params)
      render json: @data_type
    else
      render json: @data_type.errors, status: :unprocessable_entity
    end
  end

  # DELETE /data_types/1
  def destroy
    @data_type.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_data_type
      @data_type = DataType.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def data_type_params
      params.require(:data_type).permit(:name)
    end
end
