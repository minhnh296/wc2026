import { Transform } from 'class-transformer';

/**
 * Custom decorator tự động lấy giá trị từ object quan hệ (relation) lồng nhau
 * và tự động giữ lại giá trị cũ nếu bị serialize lần 2.
 * 
 * @param relationKey Tên của object quan hệ (ví dụ: 'country', 'position')
 * @param fieldName Tên trường cần lấy trong object quan hệ (mặc định là 'name')
 */
export function TransformRelationName(relationKey: string, fieldName = 'name') {
  return Transform(({ value, obj }) => {
    const rawObj = obj as Record<string, unknown> | undefined;
    const relation = rawObj?.[relationKey] as Record<string, unknown> | undefined;
    return (relation?.[fieldName] as string) ?? value ?? null;
  });
}
