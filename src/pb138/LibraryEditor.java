package pb138;

import java.io.File;
import org.odftoolkit.simple.SpreadsheetDocument;
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
            table.getCellByPosition(1, 0).setStringValue("Titul");
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
                    categorySheet.getCellByPosition(0, i).setStringValue(String.valueOf(i));
                    categorySheet.getCellByPosition(1, i).setStringValue(name);
                    return true;
                }
            }
        }
        return false;
    }
    
    public boolean changeRecordAttr(String name, String attr, String value) {
        if (doc.getSheetByName(attr) != null && doc.getSheetByName(value) != null) {
            int i = 0;
            do {
                if (doc.getSheetByName(attr).getCellByPosition(1, i).getStringValue().equals(name)) {
                    removeRecord(name);
                    addRecord(name, value);
                    return true;
                }
                ++i;
            } while (!doc.getSheetByName(attr).getCellByPosition(1, i).getStringValue().equals("")); 
        } else if (doc.getSheetByName(attr) != null && !containsRecord(name)) {
            int i = 0;
            do {
                if (doc.getSheetByName(attr).getCellByPosition(1, i).getStringValue().equals(name)) {
                    doc.getSheetByName(attr).getCellByPosition(1, i).setStringValue(value);
                    return true;
                }
                ++i;
            } while (!doc.getSheetByName(attr).getCellByPosition(1, i).getStringValue().equals("")); 
        }
        return false;
    }
    
    public boolean removeRecord(String name) {
        int j;
        for (int i = 0; i < doc.getSheetCount(); ++i) {
            j = 1;
            do {
                if (doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(name)) {
                    do {
                        doc.getSheetByIndex(i).getCellByPosition(1, j).setStringValue(doc.getSheetByIndex(i).getCellByPosition(1, j + 1).getStringValue());
                        ++j;
                    } while (!doc.getSheetByIndex(i).getCellByPosition(1, j).getStringValue().equals(""));
                    doc.getSheetByIndex(i).getCellByPosition(0, j - 1).setStringValue("");
                    doc.getSheetByIndex(i).getCellByPosition(1, j - 1).setStringValue("");
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
}
