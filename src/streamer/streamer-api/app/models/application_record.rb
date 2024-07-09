class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  IS_FETCH_FROM_CACHE = false

  def as_json(params = {})
    params[:only] ||= []
    params[:except] ||= %i[created_at updated_at]
    params[:extra_cols] ||= []
    columns = self.class.column_names
    columns += params[:extra_cols]
    cols = params[:only].empty? ? columns : params[:only]
    cols = cols.map(&:to_s) - (params[:except].map(&:to_s) - params[:only].map(&:to_s))
    super(only: cols, methods: params[:extra_cols])
  end

  def self.fetch_all_cache_key(params = {})
    "#{table_name}:fetch_all:#{params.sort.to_s}"
  end

  def self.fetch_all(params = {})
    if self::IS_FETCH_FROM_CACHE
      cache_data = Rails.cache.fetch(fetch_all_cache_key(params), expires_in: 1.day) do
        search(params).to_a.to_json
      end
      result = JSON.parse(cache_data)
    else
      result = search(params).to_a
    end
    result
  end

  def self.fetch_cache_key(id)
    "#{self.table_name}:fetch:#{id}"
  end

  def self.fetch(id)
    if self::IS_FETCH_FROM_CACHE
      cache_data = Rails.cache.fetch(fetch_cache_key(id), expires_in: 1.day) do
        find(id).as_json.to_json
      end
      result = JSON.parse(cache_data)
    else
      result = find(id).as_json.to_json
    end
    result
  end

  def self.search(params = {})
    data = params[:data] || all

    # default params
    params[:keywords_columns] ||= ["#{table_name}.name"]

    # joins
    if params[:inner_joins].present?
      params[:inner_joins].each do |j|
        if j.instance_of?(Symbol) || j.instance_of?(String)
          tbname = j.to_s
          fkey = "#{tbname.singularize}_id"
        else
          tbname = j[:table_name].to_s
          fkey = j[:foreign_key].to_s
        end
        data = data.joins "inner join #{tbname} on #{tbname}.id = #{table_name}.#{fkey}"
      end
    end

    if params[:left_joins].present?
      params[:left_joins].each do |j|
        if j.instance_of?(Symbol) || j.instance_of?(String)
          tbname = j.to_s
          fkey = "#{tbname.singularize}_id"
        else
          tbname = j[:table_name].to_s
          fkey = j[:foreign_key].to_s
        end
        data = data.joins "left join #{tbname} on #{tbname}.id = #{table_name}.#{fkey}"
      end
    end

    # soft delete
    if column_names.include?('is_soft_deleted') && params[:show_is_soft_deleted].blank?
      if params[:is_soft_deleted].blank?
        data = data.where "#{table_name}.is_soft_deleted is not true"
      else
        data = data.where "#{table_name}.is_soft_deleted = true"
      end
    end
    params.delete :show_is_soft_deleted
    params.delete :is_soft_deleted

    # filters all params[:column_name]
    if params[:omit_default_filters].blank?
      column_names.each do |cname|
        data = data.where "#{table_name}.#{cname} = ?", params[cname.to_sym] if params[cname.to_sym].present? && cname != "data"
        if cname.split('_').last == 'id' && params["#{cname}s".to_sym].present?
          data = data.where "#{table_name}.#{cname} in (#{JSON.parse(params["#{cname}s".to_sym].to_s).join(',')})"
        end
      end
    end

    # keywords
    if params[:keywords].present? && params[:keywords_columns].present?
      params[:keywords].split(' ').each do |k|
        kw_sqls = []
        kws = []
        params[:keywords_columns].each do |cname|
          kw_sqls << "#{cname} ~* ?"
          kws << k
        end
        data = data.where(kw_sqls.join(' or '), *kws)
      end
    end

    # get total data (before limit,offset)
    total_query = data
    total_query = total_query.except(:select).select('COUNT(*) as total')
    total_sql = total_query.to_sql

    order = params[:order]
    offset = params[:offset].to_i
    limit = params[:limit].to_i
    page = params[:page].to_i
    offset = (page - 1) * limit if page.positive?

    data = data.order(order)
    data = data.offset(offset) if offset
    data = data.limit(limit) if limit.positive?

    # use as_json instead of direct query
    if params[:use_as_json].present?
      results = connection.execute data.except(:select).to_sql
      columns = column_names
      columns += (params[:extra_cols] || [])
      results = results.map do |attr|
        attr.each { |k, _v| attr.delete(k) unless columns.include?(k) }
        obj = new attr
        obj.as_json(params[:as_json_option] ||= {})
      end
    else
      results = connection.execute data.to_sql
    end

    if params[:datatable]
      total = connection.execute total_sql
      total_record = total[0]['total'].to_i
      total_page = limit.zero? ? 1 : (total_record.to_f / limit).ceil
      page = limit.zero? ? 1 : 1 + (offset / limit)

      items = []
      results.to_a.each do |item|
        read_only_cfg = find(item['id']).get_read_only
        item.merge!({ read_only: read_only_cfg[:is_read_only], editable_fields: read_only_cfg[:editable_fields] })
        items << item
      end

      {
        data: items,
        total: total_record,
        total_page: total_page,
        page: page,
        limit: limit,
        offset: offset
      }
    else
      results
    end
  end

end
