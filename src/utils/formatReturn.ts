interface Policy {
  desc: string[];
  valid: boolean;
}

interface File {
  desc: string | null;
  valid: boolean;
}

interface DataItem {
  page: string | null;
  valid: boolean;
}

export async function formatReturn(
  policies?: Record<string, Policy>,
  files: File[] = []
): Promise<DataItem[]> {
  const data: DataItem[] = [];

  console.log("data pré tratamento: ", data);
  console.log("policies: ", policies);
  console.log("files: ", files);

  for (const key in policies) {
    if (Object.prototype.hasOwnProperty.call(policies, key)) {
      const value = policies[key];
      const description = value.desc.length > 0 ? value.desc[0] : null;
      data.push({ page: description, valid: value.valid });
    }
  }

  if (files.length > 0) {
    files.forEach((file) => {
      data.push({ page: file.desc, valid: file.valid });
    });
  }

  console.log("data pós tratamento: ", data);

  return data;
}

export default formatReturn;
