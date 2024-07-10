require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module StreamerApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w(assets tasks))

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # local time zone
    config.time_zone = 'Bangkok'
    config.active_record.default_timezone = :local
    config.active_record.time_zone_aware_attributes = false

    # Action Cable configuration
    # config.action_cable.mount_path = '/cable'
    config.action_cable.mount_path = nil
    config.action_cable.url = nil
    config.action_cable.allowed_request_origins = [/http:\/\/.*/]

    # Add back session middleware for Action Cable
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    # config.middleware.use ActionCable::Connection::RescueMiddleware

    # rack-cors
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: %i[get post put patch delete options]
      end
    end

    # hosts
    config.hosts << /.*/

    # disable active_record belongs_to required by default
    config.active_record.belongs_to_required_by_default = false

    # redis cache store
    config.cache_store = :redis_cache_store, { url: ENV['REDIS_URL'] { "redis://localhost:6379/1" } }
    config.public_file_server.headers = {
      "Cache-Control" => "public, max-age=#{2.days.to_i}"
    }
  end

  # redis connection pool
  def self.redis
    @redis ||= ConnectionPool::Wrapper.new do
      Redis.new(url: ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } )
    end
  end
  
end
