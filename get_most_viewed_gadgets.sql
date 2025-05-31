-- Function to get most viewed gadgets
CREATE OR REPLACE FUNCTION get_most_viewed_gadgets(limit_count integer)
RETURNS SETOF gadgets AS $$
BEGIN
  RETURN QUERY
  SELECT g.*
  FROM gadgets g
  JOIN (
    SELECT gadget_id, COUNT(*) as view_count
    FROM gadget_views
    WHERE view_type = 'product'
    GROUP BY gadget_id
    ORDER BY view_count DESC
    LIMIT limit_count
  ) v ON g.id = v.gadget_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
