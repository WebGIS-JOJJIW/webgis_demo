namespace :content_subscriber do

  task :subscribe => :environment do
    StreamerApi::redis.subscribe( ENV.fetch("INGESTER_REDIS_CHANNEL") { "ingester" } ) do |on|
      on.message do |channel, message|
        # Rails.logger.info("Broadcast on channel #{channel}: #{message}")
        p "content_subscriber received message ch:'#{channel}', msg:#{message}"

        begin
          hsh = JSON.parse message
          sensor_id = hsh["sensor_id"]

          ActionCable.server.broadcast "main", message
          ActionCable.server.broadcast "sensor:#{sensor_id}:sensor_data", message
        rescue Exception => exc
          p exc.message
          p "content_subscriber failed to parse message"
        end
      end
    end
  end

end