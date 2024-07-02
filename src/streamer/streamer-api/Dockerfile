FROM ruby:3.3.3

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev libvips pkg-config

COPY ./Gemfile* /usr/src/app/
WORKDIR /usr/src/app
RUN bundle install

COPY . /usr/src/app/

# EXPOSE 3001

# CMD ["bin/rails","s","-b","0.0.0.0","-p","3001"]