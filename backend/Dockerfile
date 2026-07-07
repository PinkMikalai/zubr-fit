FROM php:8.3-cli-alpine

RUN apk add --no-cache icu-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql intl opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-interaction --prefer-dist

COPY . .

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
