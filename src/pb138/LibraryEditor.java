package pb138;

import java.io.File;
import org.odftoolkit.simple.SpreadsheetDocument;
import org.odftoolkit.simple.table.Row;
import org.odftoolkit.simple.table.Table;

/**
 * Contains methods to edit the video library.
 */
public class LibraryEditor {
    private static String path = "./www/library.ods";
    private SpreadsheetDocument doc;
    
    public  boolean openDocument() {
        try {
            doc = SpreadsheetDocument.loadDocument(path);
        } catch (Exception e) {
            System.err.println("ERROR: unable to load file.");
            return false;
	}
        return true;
    }
    
    public boolean saveDocument() {
        try {
            doc.save(new File(path));
        } catch (Exception e) {
            System.err.println("ERROR: unable to save file.");
            return false;
	}
        return true;
    }
    
    public boolean addCategory(String name) {
        if (doc.getSheetByName(name) == null) {
            Table table = doc.appendSheet(name);
            table.getCellByPosition(0, 0).setStringValue("Id");
            table.getCellByPosition(1, 0).setStringValue("Film 1");
            table.getCellByPosition(2, 0).setStringValue("Film 2");
            table.getCellByPosition(3, 0).setStringValue("Film 3");
            table.getCellByPosition(4, 0).setStringValue("Film 4");
            table.getCellByPosition(5, 0).setStringValue("Film 5");
            return true;
        }
        return false;
    }
    
    public boolean renameCategory(String oldName, String newName) {
        Table categorySheet;
        if ((categorySheet = doc.getSheetByName(oldName)) != null && doc.getSheetByName(newName) == null) {
            categorySheet.setTableName(newName);
            return true;
        }
        return false;
    }
    
    public boolean removeCategory(String name) {
        for (int i = 0; i < doc.getSheetCount(); ++i) {
            if (doc.getSheetByIndex(i).getTableName().equals(name) && doc.getSheetByIndex(i).getCellByPosition(1, 1).getStringValue().equals("")) {
                doc.removeSheet(i);
                return true;
            }
        }
        return false;
    }
    
    public boolean addRecord(String name, String category) {
        Table categorySheet;
        if ((categorySheet = doc.getSheetByName(category)) != null && !containsRecord(name)) {
            for (int i = 1;;++i) {
                if (categorySheet.getCellByPosition(1, i).getStringValue().equals("")) {
                    int id = categorySheet.getCellByPosition(0, 1).getStringValue().equals("") ? 1 : Integer.parseInt(categorySheet.getCellByPosition(0, i - 1).getStringValue()) + 1;
                    categorySheet.getCellByPosition(0, i).setStringValue(String.valueOf(id));
                    categorySheet.getCellByPosition(1, i).setStringValue(name);
                    return true;
                }
            }
        }
        return false;
    }
    
    public boolean changeRecordAttr(String name, String attr, String value) {
        Table toCategory;
        if (attr.equals("category") && (toCategory = doc.getSheetByName(value)) != null) {
            for (int i = 0; i < doc.getSheetCount(); ++i) {
                int j = 0;
                do {
                    if (doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(name)) {
                        Row row = doc.getSheetByIndex(i).getRowByIndex(j);
                        for (int line = 1;; ++line) {
                            if (toCategory.getCellByPosition(1, line).getStringValue().equals("")) {
                                int id = toCategory.getCellByPosition(0, 1).getStringValue().equals("") ? 1 : Integer.parseInt(toCategory.getCellByPosition(0, line - 1).getStringValue()) + 1;
                                toCategory.getCellByPosition(0, line).setStringValue(String.valueOf(id));
                                for (int h = 1; h < 6; ++h) {
                                    toCategory.getCellByPosition(h, line).setStringValue(row.getCellByIndex(h).getStringValue());
                                }
                                doc.getSheetByIndex(i).removeRowsByIndex(j, 1);
                                return true;
                            }
                        }
                    }
                    ++j;
                } while (!doc.getSheetByIndex(i).getCellByPosition(0, j).getStringValue().equals(""));
            }
        } else {
            for (int i = 0; i < doc.getSheetCount(); ++i) {
                int j = 0;
                do {
                    if (doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(name)) {
                        switch(attr) {
                            case "Film 1":
                                doc.getSheetByIndex(i).getCellByPosition(1, j).setStringValue(value);
                                break;
                            case "Film 2":
                                doc.getSheetByIndex(i).getCellByPosition(2, j).setStringValue(value);
                                break;
                            case "Film 3":
                                doc.getSheetByIndex(i).getCellByPosition(3, j).setStringValue(value);
                                break;   
                            case "Film 4":
                                doc.getSheetByIndex(i).getCellByPosition(4, j).setStringValue(value);
                                break;
                            case "Film 5":
                                doc.getSheetByIndex(i).getCellByPosition(5, j).setStringValue(value);
                                break;    
                            default:
                                return false;
                        }
                        
                        return true;
                    }
                    ++j;
                } while (!doc.getSheetByIndex(i).getCellByPosition(0, j).getStringValue().equals(""));
            }
        } 
        return false;
    }
    
    public boolean removeRecord(String name) {
        int j;
        for (int i = 0; i < doc.getSheetCount(); ++i) {
            j = 1;
            do {
                if (doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(name)) {
                    doc.getSheetByIndex(i).removeRowsByIndex(j, 1);
                    return true;
                }
                ++j;
            } while (!doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(""));
        }
        return false;
    }
    
    private boolean containsRecord(String name) {
        int j;
        for (int i = 0; i < doc.getSheetCount(); ++i) {
            j = 0;
            do {
                if (doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(name)) {
                    return true;
                }
                ++j;
            } while (!doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(""));
        }
        return false;
    }

    String returnDocument() {
        // TODO automatically generated method
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
